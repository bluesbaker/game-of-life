/**
 * Get the github repository info
 * @param {string} name - github user name
 * @param {string} repo - github repository name
 */
async function getRepository(name, repo) {
    let repository = await fetch(`https://api.github.com/users/${name}/repos`)
    .then(result => {
        if(result.status != 200) {
            return null;
        }
        else {
            return result.json();
        }
    })
    .catch(err => {
        return new Error(err);
    });

    return repository.filter(r => r.name === repo)[0];
}

/**
 * Get the github user info
 * @param {string} name - github user name
 * @returns github user info
 */
async function getUser(name) {
    let user = await fetch(`https://api.github.com/users/${name}`)
    .then(result => {
        if(result.status != 200) {
            return null;
        }
        else {
            return result.json();
        }
    })
    .catch(err => {
        return new Error(err);
    });

    return user;
}

export { getUser, getRepository }