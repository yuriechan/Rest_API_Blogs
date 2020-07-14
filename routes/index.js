// Build an Express server 
const express = require('express')
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const router = express.Router()

// import functions for data operations
const { helloWorld, userLogin, listAllBlogs, getBlogById, createBlog, deleteBlog, updateBlog } = require('../controllers/blogController')

// import middleware for user authentication 
const { verifyAuth } = require('../middleware/verifyToken')

// Greeting at root path
router.get('/', helloWorld)

// Login User 
router.post('/login', urlencodedParser, userLogin)

// Get all document inside the collection
router.get('/blogs', verifyAuth, listAllBlogs)

// Get one document inside the collection 
router.get('/blogs/:id', verifyAuth, getBlogById)

// Post one document inside the collection
router.post('/blogs/create', verifyAuth, urlencodedParser, createBlog)

// Delete one document inside the collection
router.delete('/blogs/delete/:id', verifyAuth, deleteBlog)

// Update one document inside the collection
router.put('/blogs/update/:id', verifyAuth, urlencodedParser, updateBlog)

module.exports = router 
