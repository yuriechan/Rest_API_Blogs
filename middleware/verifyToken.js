const { admin } = require('../firebaseAdminConfig')


// add readme, to change config in postman 
const getAuthToken = (req, res, next) => {
    const bearerHeader = req.headers.authorization
    if (bearerHeader && bearerHeader.split(' ')[0] === 'Bearer') {
        req.authToken = bearerHeader.split(' ')[1]
    } else {
        req.authToken = null
    }
    next()
}

const verifyAuth = (req, res, next) => {
    getAuthToken(req, res, async () => {
        try {
            const { authToken } = req
            admin.auth().verifyIdToken(authToken).then(decodedToken => {
                req.authId = decodedToken.uid
            }).catch(error => {
                // auto generated error from google's api 
                res.status(404).send({ status: 404, error: error })
            })
            return next()
        } catch (e) {
            return res.status(401).send({ status: 401, error: "Auth failed." })
        } 
    })
}



module.exports = {
    verifyAuth,
    getAuthToken
}