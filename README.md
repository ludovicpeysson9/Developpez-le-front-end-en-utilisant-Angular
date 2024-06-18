# Olympic Games App

Lien du repo : https://github.com/ludovicpeysson9/Developpez-le-front-end-en-utilisant-Angular.git

## Description

Ce projet est une application web développée avec Angular. Il est composé d’un dashboard qui présente un graphique sous forme de camembert qui représente les pays ayant participés aux JO (défini dans `olympic.json`) selon leur nombre de médailles gagnées.

Pour plus de détails on peut cliquer sur une part de ce camembert et être redirigé vers un graphique de type courbe, plus représentatif des statistiques des pays selon leurs participations.

## Bibliothèques

Les bibliothèques utilisées sont : 
- `chart.js`  
- `ng2-charts` 

## Prérequis

Pour faire fonctionner ce projet, il vous faudra Node.js, avec le gestionnaire de paquets npm ainsi que Angular CLI. Il vous faudra peut être également Angular CDK.

### Récapitulatif des différentes versions : 

- Node.js 14.15.0 (version minimum requise), avec npm 6.14.8
- Angular CLI 14.1.0
- Angular CDK 14.1.0
- chart.js 3.9.1
- ng2-charts 3.1.0

## Processus d’installation du projet

1. Installer Node.js 14.15.0 minimum.
2. Vérifier l’installation avec la version, vérifier également l’installation de npm et sa version.
3. Installer Angular CLI 14.1.0, vérifier l’installation et sa version.
4. Cloner le projet https://github.com/ludovicpeysson9/Developpez-le-front-end-en-utilisant-Angular.git.
5. Vérifier dans le fichier `package.json` s'il y a bien la dépendance Angular CDK 14.1.0.
6. Le cas échéant, ouvrir un terminal à la racine du projet (là où se trouve le fichier `package.json`) et installer Angular CDK 14.1.0.
7. Toujours à cet endroit, lancer `npm install`.
8. Toujours à cet endroit, lancer la commande `ng serve`.
9. Vous avez désormais accès au projet à l’adresse suivante http://localhost:4200
