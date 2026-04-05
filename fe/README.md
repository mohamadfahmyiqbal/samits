# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Lokal HTTPS & sertifikat

- Development server sudah diaktifkan dengan `HTTPS=true` dan akan memuat certificate/key yang ditunjuk oleh `SSL_CRT_FILE`/`SSL_KEY_FILE` di `.env` (`cert/pik1com074.local.ikoito.co.id/certificate.cer` + `cert/pik1com074.local.ikoito.co.id/private.key`).
- Agar browser menerima TLS backend yang memakai sertifikat internal `https://pik1com074.local.ikoito.co.id:5002`, impor `fe/cert/pik1com074.local.ikoito.co.id/certificate.cer` ke trust store sistem Anda dan pastikan environment (`REACT_APP_API_BASE_URL`) tetap menunjuk host yang sama.
  - **Windows**: jalankan `certutil -addstore Root "D:\DEV\REACT\samit\fe\cert\pik1com074.local.ikoito.co.id\certificate.cer"` atau buka file sertifikat dan gunakan wizard **Install Certificate...** → simpan di *Trusted Root Certification Authorities* untuk user saat ini.
  - **macOS**: `sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain /path/to/fe/cert/pik1com074.local.ikoito.co.id/certificate.cer`, lalu restart browser.
  - **Linux (Debian/Ubuntu)**: `sudo cp fe/cert/pik1com074.local.ikoito.co.id/certificate.cer /usr/local/share/ca-certificates/pik1com074.crt && sudo update-ca-certificates`.
- Setelah sertifikat terpasang, restart browser agar perubahan trust diterapkan. Semua panggilan `https://pik1com074.local.ikoito.co.id:5002` (atau host backend) akan memakai sertifikat yang dipercaya.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [https://pik1com074.local.ikoito.co.id:3000](https://pik1com074.local.ikoito.co.id:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
