


```bash
cd lis-hub-lib
npm install
npm run lib          # rollup build → dist/
npm link

cd ../lis-request-app
npm link @lis/lis-hub-lib
npm run build
```

