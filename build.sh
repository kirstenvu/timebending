#!/bin/bash
set -e

mkdir -p public/flow public/quiz public/begroting

cd apps/flow
npm install
npm run build
cp -r dist/. ../../public/flow/
cd ../..

cd apps/quiz
npm install
npm run build
cp -r dist/. ../../public/quiz/
cd ../..

cd apps/begroting
npm install
npm run build
cp -r dist/. ../../public/begroting/
cd ../..
