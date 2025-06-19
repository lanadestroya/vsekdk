window.addEventListener('DOMContentLoaded', async () => { 
    const token = localStorage.getItem('token');
    const authRefEl = document.querySelector('#auth-ref')
    const profileLinkEl = document.querySelector('#profile-link')
    
    async function getUser(token) {
        const res = await fetch(`/api/user`, {headers: {
            Authorization: 'Bearer ' + token
        }})
        const data = await res.json()
        return data
    }

    if (token) {
        if (authRefEl) {
            authRefEl.remove()
        }
       
        const user = await getUser(token)
        console.log('---- user ----', user)
        const userMailEl = document.querySelector('#user-mail');
        if (userMailEl) {
            userMailEl.innerHTML = user.login
            userMailEl.setAttribute('href', 'mailto:' +user.login)
        }
        
        // Сохраняем роль пользователя
        if (user.role && user.role.name) {
            localStorage.setItem('userRoleId', user.role['id']);
        }
    } else {
        if (window.location.pathname === '/client/lc.html') {
            window.location.pathname = '/client/index.html'
        }
        console.log('have not token')
        if (profileLinkEl) {
            profileLinkEl.remove()
        }
    }
})