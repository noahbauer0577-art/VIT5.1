import json
import os
import zipfile
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, log_loss

OUTPUT_DIR = Path('/content/vit_training_output')
MODELS_DIR = OUTPUT_DIR / 'models'
DATA_DIR = OUTPUT_DIR / 'data'
MODELS_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

def load_football_data_csv(csv_path):
    df = pd.read_csv(csv_path)
    required = ['home_team', 'away_team', 'home_goals', 'away_goals']
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f'Missing required columns: {missing}')
    return df

def build_features(df):
    rows = []
    team_stats = {}
    for _, row in df.iterrows():
        home = str(row['home_team'])
        away = str(row['away_team'])
        hs = team_stats.get(home, {'played':0,'gf':0,'ga':0,'points':0})
        aas = team_stats.get(away, {'played':0,'gf':0,'ga':0,'points':0})
        rows.append({
            'home_form_points': hs['points'] / max(hs['played'], 1),
            'away_form_points': aas['points'] / max(aas['played'], 1),
            'home_gf_pg': hs['gf'] / max(hs['played'], 1),
            'away_gf_pg': aas['gf'] / max(aas['played'], 1),
            'home_ga_pg': hs['ga'] / max(hs['played'], 1),
            'away_ga_pg': aas['ga'] / max(aas['played'], 1),
            'target': 0 if row['home_goals'] > row['away_goals'] else 1 if row['home_goals'] == row['away_goals'] else 2,
            'home_team': home,
            'away_team': away,
        })
        hg, ag = int(row['home_goals']), int(row['away_goals'])
        hs['played'] += 1; aas['played'] += 1
        hs['gf'] += hg; hs['ga'] += ag
        aas['gf'] += ag; aas['ga'] += hg
        if hg > ag: hs['points'] += 3
        elif hg < ag: aas['points'] += 3
        else: hs['points'] += 1; aas['points'] += 1
        team_stats[home] = hs; team_stats[away] = aas
    return pd.DataFrame(rows)

def train_models(features):
    cols = ['home_form_points','away_form_points','home_gf_pg','away_gf_pg','home_ga_pg','away_ga_pg']
    X = features[cols].fillna(0)
    y = features['target']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y if y.nunique() == 3 else None)
    models = {
        'logistic_v1.pkl': LogisticRegression(max_iter=1000),
        'rf_v1.pkl': RandomForestClassifier(n_estimators=250, random_state=42, class_weight='balanced'),
        'xgb_v1.pkl': GradientBoostingClassifier(random_state=42),
    }
    metrics = {}
    for name, model in models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        metrics[name] = {'accuracy': float(accuracy_score(y_test, preds))}
        if hasattr(model, 'predict_proba'):
            metrics[name]['log_loss'] = float(log_loss(y_test, model.predict_proba(X_test), labels=[0,1,2]))
        joblib.dump({'model': model, 'feature_columns': cols, 'target_labels': ['home','draw','away'], 'metrics': metrics[name]}, MODELS_DIR / name)
    return metrics

def package_output(source_df, metrics):
    source_df.to_json(DATA_DIR / 'historical_matches.json', orient='records', indent=2)
    with open(OUTPUT_DIR / 'training_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    zip_path = OUTPUT_DIR / 'vit_models.zip'
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for p in MODELS_DIR.glob('*.pkl'):
            zf.write(p, p.name)
        zf.write(DATA_DIR / 'historical_matches.json', 'historical_matches.json')
        zf.write(OUTPUT_DIR / 'training_metrics.json', 'training_metrics.json')
    return zip_path

if __name__ == '__main__':
    csv_path = os.environ.get('VIT_TRAINING_CSV', '/content/historical_matches.csv')
    df = load_football_data_csv(csv_path)
    features = build_features(df)
    metrics = train_models(features)
    out = package_output(df, metrics)
    print(f'Training complete: {out}')
    print(json.dumps(metrics, indent=2))
