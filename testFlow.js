
(async () => {
    try {
        const baseURL = 'http://localhost:4000/api';
        
        console.log('Testing GET /therapies');
        const thRes = await fetch(baseURL + '/therapies').then(r => r.json());
        console.log('Therapies count:', thRes.therapies ? thRes.therapies.length : thRes);

        console.log('Testing GET /packages');
        const pkgRes = await fetch(baseURL + '/packages').then(r => r.json());
        console.log('Packages count:', pkgRes.packages ? pkgRes.packages.length : pkgRes);

        console.log('Testing GET /therapy-sessions');
        const sessRes = await fetch(baseURL + '/therapy-sessions').then(r => r.json());
        console.log('Sessions count:', sessRes.sessions ? sessRes.sessions.length : sessRes);

        console.log('All tests passed!');
    } catch (error) {
        console.error('Test failed:', error);
    }
})();
