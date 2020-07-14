// import firestore DB
const { db, auth } = require('../firebaseConfig')

function helloWorld (req, res, next) {
    res.status(200).send("Hello World, the server is up and running :)")
}


function userLogin (req, res, next) {
    const { email, password } = req.body
    const keyOfReqBody = Object.keys(req.body)
    if (keyOfReqBody[0] !== 'email' || keyOfReqBody[1] !== 'password') {
        return res.status(400).send({ status: 400, message: "'email' and 'password' keys should be set." })
    } else if (email.length === 0 || password.length === 0) {
        return res.status(400).send({ status: 400, message: "'email' and 'password' values cannot be empty." })
    } 

    auth.signInWithEmailAndPassword(email, password).then(result => {
        result.user.getIdToken().then((token) => {
            const responseBody = {
                    status: 200,
                    message: "Auth Success.",
                    token: token 
                }
            res.send(responseBody)
        })
    }).catch(error => {
        // auto generated error from google's api 
        res.status(404).send({ status: 404, error: error })
    })
}


function listAllBlogs (req, res, next) {
    const allBlogPosts = []
    
    const getAllDocument = async () => {
        const blogRef = db.collection('blogs')
        const blogDocs = await blogRef.get()
        if (blogDocs.empty) {
            return res.status(200).send({ status: 200, message: "No matching document." })
        }
        blogDocs.forEach(doc => {
            const blogPost = {
                id: doc.id,
                title: doc.data().title,
                content: doc.data().content,
                created_at: doc.data().created_at,
                modified_at: doc.data().modified_at
            } 
            allBlogPosts.push(blogPost)
        })
        res.status(200).send({ status: 200, result: allBlogPosts })
    }
    
    getAllDocument().catch(error => {
        res.status(404).send({ status: 404, error: `Failed to list all blog posts, ${error}` })
    })
}

function getBlogById (req, res, next) {
    const id = req.params.id
    const getOneDocumentById = async () => {
        const blogRef = db.collection('blogs').doc(id)
        const blogDoc = await blogRef.get()
        if (!blogDoc.exists) {
            return res.status(200).send({ status: 200, message: "No matching document." })
        }
        const blogPost = {
            id: blogDoc.id,
            title: blogDoc.data().title,
            content: blogDoc.data().content,
            created_at: blogDoc.data().created_at,
            modified_at: blogDoc.data().modified_at
        }
        res.status(200).send({ status: 200, result: blogPost })
    }
    getOneDocumentById().catch(error => {
        res.status(404).send({ status: 404, error: `Failed to fetch a blog post, ${error}` })
    })
}

function createBlog (req, res, next) {
    const { title, content } = req.body
    const keyOfReqBody = Object.keys(req.body)
    
    if (keyOfReqBody[0] !== 'title' || keyOfReqBody[1] !== 'content') {
        return res.status(400).send({ status: 400, message: "'title' and 'content' keys should be set." })
    } else if (title.length === 0 || content.length === 0) {
        return res.status(400).send({ status: 400, message: "'title' and 'content' values cannot be empty." })
    } 

    const newBlogPost = {
        title: title,
        content: content,
        created_at: Date()
    }

    const AddOneDocument = async () => {
        const newDocument = await db.collection('blogs').add(newBlogPost)
        const newBlogPostWithId = {
            id: newDocument.id,
            ...newBlogPost
        }
        res.status(200).send({ status: 200, result: newBlogPostWithId })
    }
    AddOneDocument().catch(error => {
        res.status(404).send({ status: 404, error: `Failed to add one blog post, ${error}` })
    })
}

function deleteBlog (req, res, next) {
    const id = req.params.id

    const getOneDocumentById = async () => {
        const blogRef = db.collection('blogs').doc(id)
        const blogDoc = await blogRef.get()
        if (!blogDoc.exists) {
            return res.status(200).send({ status: 200, message: "No matching document." })
        }
       
        const deleteOneDocumentById = async () => {
            const deletionComplete = await blogRef.delete()
            res.status(200).send({ status: 200, message: `Blog post with ID of ${id} is deleted.` })
        }
        deleteOneDocumentById().catch(error => {
            // catch error during delete transaction
            res.status(404).send({ status: 404, error: "Error while deleting blog" })
        })
    }
    getOneDocumentById().catch(error => {
        // catch error during get transaction
        res.status(404).send({ status: 404, error: "Error while getting blog" })
    })
}

function updateBlog (req, res, next) {
    const { title, content } = req.body
    const keyOfReqBody = Object.keys(req.body)
    const id = req.params.id
    const blogRef = db.collection('blogs').doc(id)

    const updateDocumentById = async () => {
        try {
            await db.runTransaction(async (t) => {
                const blogDoc = await t.get(blogRef)
                if (!blogDoc.exists) {
                    return res.status(200).send({ status: 200, message: "No matching document." })
                } else if (keyOfReqBody[0] !== 'title' || keyOfReqBody[1] !== 'content') {
                    return res.status(400).send({ status: 400, message: "'title' and 'content' keys should be set." })
                } else if (title.length === 0) {
                    // Empty body is allowed
                    return res.status(400).send({ status: 400, message: "'title' value cannot be empty." })
                } 
                t.update(blogRef, {
                    title: title,
                    content: content,
                    modified_at: Date()
                })
                res.status(200).send({ status: 200, message: `Blog post with ID of ${id} is updated.` })
            })
        } catch (error) {
            res.status(404).send({ status: 404, error: `Failed to update one blog post, ${error}` })
        }
    }
    updateDocumentById()
}

module.exports = {
    helloWorld,
    userLogin,
    listAllBlogs,
    getBlogById,
    createBlog,
    deleteBlog,
    updateBlog
}