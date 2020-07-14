const chai = require("chai")
const chaiHttp = require("chai-http")
const expect = chai.expect
const server = require("../app")

const dotenv = require('dotenv')
dotenv.config()

chai.use(chaiHttp)
let blogIdForAllEndpointTest = null 
let tokenForAllEndpointTest = null


/*

Tests for / - Greeting with simple texts

*/
describe("First Test, /", function() {
    it("Express server is live", function(done) {
        chai.request(server)
        .get('/')
        .end(function (err, res) {
            expect(res).to.have.status(200)
            expect(res.text).to.equal("Hello World, the server is up and running :)")
            done()
        })
    })
})


/*

Tests for /login - Login user with JWT 

*/
describe("Login Test, /login", function() {
    it("should login successfully with token issued", function(done) {
        chai.request(server)
        .post('/login')
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email: process.env.LOGIN_EMAIL, password: process.env.LOGIN_PASSWORD })
        .end(function (err, res) {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property("message")
            expect(res.body).to.have.property("token")
            expect(res.body.message).to.equal("Auth Success.")
            done()
        })
    })

    it("should fail login when password key missing", function(done) {
        chai.request(server)
        .post('/login')
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email: process.env.LOGIN_EMAIL })
        .end(function (err, res) {
            expect(res).to.have.status(400)
            expect(res.body).to.have.property("message")
            expect(res.body.message).to.equal("'email' and 'password' keys should be set.")
            done()
        })
    })

    it("should fail login when email key missing", function(done) {
        chai.request(server)
        .post('/login')
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ password: process.env.LOGIN_PASSWORD })
        .end(function (err, res) {
            expect(res).to.have.status(400)
            expect(res.body).to.have.property("message")
            expect(res.body.message).to.equal("'email' and 'password' keys should be set.")
            done()
        })
    })

    it("should fail login when email value is empty", function(done) {
        chai.request(server)
        .post('/login')
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email: '', password: process.env.LOGIN_PASSWORD })
        .end(function (err, res) {
            expect(res).to.have.status(400)
            expect(res.body).to.have.property("message")
            expect(res.body.message).to.equal("'email' and 'password' values cannot be empty.")
            done()
        })
    })

    it("should fail login when password value is empty", function(done) {
        chai.request(server)
        .post('/login')
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email: process.env.LOGIN_EMAIL, password: '' })
        .end(function (err, res) {
            expect(res).to.have.status(400)
            expect(res.body).to.have.property("message")
            expect(res.body.message).to.equal("'email' and 'password' values cannot be empty.")
            done()
        })
    })

    it("should fail login when wrong email and password is used", function(done) {
        chai.request(server)
        .post('/login')
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email: 'hopeitworks@com', password: 'plzwork' })
        .end(function (err, res) {
            expect(res).to.have.status(404)
            expect(res.body).to.have.property("error")
            expect(res.body.error.code).to.equal("auth/user-not-found")
            done()
        })
    })
})


/*

Tests for /blogs/create - Creating blog post 

*/
describe("Create a blog post Test, /blogs/create", function() {
    
    before(function(done) {
        if (tokenForAllEndpointTest !== null) {
            return done()
        }
        chai.request(server)
        .post('/login')
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email: process.env.LOGIN_EMAIL, password: process.env.LOGIN_PASSWORD })
        .end(function (err, res) {
            tokenForAllEndpointTest = res.body.token
            done()
        })
    })

   it("should create a blog post with valid authentication", function (done) {
    const testBlogTitle = '[should succeed] This post is for Unit Test'
    const testBlogContent = '[should succeed] Writing unit tests with mocha...'

    chai.request(server)
        .post('/blogs/create')
        .set('Authorization', `Bearer ${tokenForAllEndpointTest}`)
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ title: testBlogTitle, content: testBlogContent })
        .end(function (err, res) {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property("result")
            expect(res.body.result.title).to.equal(testBlogTitle)
            expect(res.body.result.content).to.equal(testBlogContent)
            blogIdForAllEndpointTest = res.body.result.id
            done()
        })
   })

   it("should not create a blog post without valid authentication", function (done) {
    const testBlogTitle = '[should fail] This post is for Unit Test'
    const testBlogContent = '[should fail] Writing unit tests with mocha...'
       
    chai.request(server)
       .post('/blogs/create')
       .set("content-type", "application/x-www-form-urlencoded")
       .send({ title: testBlogTitle, content: testBlogContent })
       .end(function (err, res) {
            expect(res).to.have.status(401)
            expect(res.body).to.have.property("error")
            expect(res.body.error).to.equal("Auth failed.")
            done()
       })
   })

   it("should not create a blog post when missing title key", function (done) {
       chai.request(server)
       .post('/blogs/create')
       .set('Authorization', `Bearer ${tokenForAllEndpointTest}`)
       .set("content-type", "application/x-www-form-urlencoded")
       .send({ content: "this is my blog content" })
       .end(function (err, res) {
           expect(res).to.have.status(400)
           expect(res.body).to.have.property("message")
           expect(res.body.message).to.equal("'title' and 'content' keys should be set.")
           done()
       })
   })

    it("should not create a blog post when title is empty", function (done) {
        chai.request(server)
        .post('/blogs/create')
        .set('Authorization', `Bearer ${tokenForAllEndpointTest}`)
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ title: '', content: "this is my blog content" })
        .end(function (err, res) {
            expect(res).to.have.status(400)
            expect(res.body).to.have.property("message")
            expect(res.body.message).to.equal("'title' and 'content' values cannot be empty.")
            done()
        })
    })

    it("should not create a blog post when missing content key", function (done) {
        chai.request(server)
        .post('/blogs/create')
        .set('Authorization', `Bearer ${tokenForAllEndpointTest}`)
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ title: 'this is my blog title' })
        .end(function (err, res) {
            expect(res).to.have.status(400)
            expect(res.body).to.have.property("message")
            expect(res.body.message).to.equal("'title' and 'content' keys should be set.")
            done()
        })
    })

    it("should not create a blog post when content is empty", function (done) {
        chai.request(server)
        .post('/blogs/create')
        .set('Authorization', `Bearer ${tokenForAllEndpointTest}`)
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ title: 'this is my blog title', content: '' })
        .end(function (err, res) {
            expect(res).to.have.status(400)
            expect(res.body).to.have.property("message")
            expect(res.body.message).to.equal("'title' and 'content' values cannot be empty.")
            done()
        })
    })
})


/*

Tests for /blogs - Getting list of blog posts

*/
describe("List all blogs Test, /blogs", function() {
    
    before(function(done) {
        if (tokenForAllEndpointTest !== null) {
            return done()
        }
        chai.request(server)
        .post('/login')
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email: process.env.LOGIN_EMAIL, password: process.env.LOGIN_PASSWORD })
        .end(function (err, res) {
            tokenForAllEndpointTest = res.body.token
            done()
        })
    })

    it("should be able to list all blog posts, after valid authentication", function(done) {
        chai.request(server)
        .get('/blogs')
        .set('Authorization', `Bearer ${tokenForAllEndpointTest}`)
        .end(function (err, res) {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property("result")
            done()
        })
    })

    it("should not be able to get list of blogs, without valid authentication", function(done) {
        chai.request(server)
        .get('/blogs')
        .end(function (err, res) {
            expect(res).to.have.status(401)
            expect(res.body).to.have.property("error")
            expect(res.body.error).to.equal("Auth failed.")
            done()
        })
    })
})


/*

Tests for /blogs:id - Getting blog post by ID

*/
describe("Get single blog post by id, /blogs:id", function() {
    
    before(function(done) {
        if (tokenForAllEndpointTest !== null) {
            return done()
        }
        chai.request(server)
        .post('/login')
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email: process.env.LOGIN_EMAIL, password: process.env.LOGIN_PASSWORD })
        .end(function (err, res) {
            tokenForAllEndpointTest = res.body.token
            done()
        })
    })

    it("should get one blog post with valid blog post ID", function(done) {
        chai.request(server)
        .get('/blogs/' + blogIdForAllEndpointTest)
        .set('Authorization', `Bearer ${tokenForAllEndpointTest}`)
        .end(function (err, res) {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property("result")
            expect(res.body.result).to.have.property("id")
            expect(res.body.result).to.have.property("title")
            expect(res.body.result).to.have.property("content")
            expect(res.body.result).to.have.property("created_at")
            expect(res.body.result.id).to.equal(blogIdForAllEndpointTest)
            done()
        })
    })

    it("should not be able to get blog post without valid authentication", function(done) {
        chai.request(server)
        .get('/blogs/' + blogIdForAllEndpointTest)
        .set('Authorization', "")
        .end(function (err, res) {
            expect(res).to.have.status(401)
            expect(res.body).to.have.property("error")
            expect(res.body.error).to.equal("Auth failed.")
            done()
        })
    })

    it("should not get blog post with invalid blog post ID", function(done) {
        chai.request(server)
        .get('/blogs/' + blogIdForAllEndpointTest + "random strings")
        .set('Authorization', `Bearer ${tokenForAllEndpointTest}`)
        .end(function (err, res) {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property("message")
            expect(res.body.message).to.equal("No matching document.")
            done()
        })
    })
})

/*

Tests for /blogs/update/:id - Updating blog post by ID

*/
describe("Updating post by blog ID Test, /blogs/update/:id", function() {
    
    before(function(done) {
        if (tokenForAllEndpointTest !== null) {
            return done()
        }
        chai.request(server)
        .post('/login')
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email: process.env.LOGIN_EMAIL, password: process.env.LOGIN_PASSWORD })
        .end(function (err, res) {
            tokenForAllEndpointTest = res.body.token
            done()
        })
    })

    it("should update blog post after valid authentication", function(done) {
        chai.request(server)
        .put(`/blogs/update/${blogIdForAllEndpointTest}`)
        .set('Authorization', `Bearer ${tokenForAllEndpointTest}`)
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ title: 'Unit test edited this', content: 'This test is automated....!' })
        .end(function (err, res) {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property("message")
            expect(res.body.message).to.equal(`Blog post with ID of ${blogIdForAllEndpointTest} is updated.`)
            done()
        })
    })

    it("should not update blog post without valid authentication", function(done) {
        chai.request(server)
        .put(`/blogs/update/${blogIdForAllEndpointTest}`)
        .set('Authorization', "")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ title: 'Unit test edited this', content: 'This test is automated....!' })
        .end(function (err, res) {
            expect(res).to.have.status(401)
            expect(res.body).to.have.property("error")
            expect(res.body.error).to.equal("Auth failed.")
            done()
        })
    })

    it("should not update blog post with empty title", function(done) {
        chai.request(server)
        .put(`/blogs/update/${blogIdForAllEndpointTest}`)
        .set('Authorization', `Bearer ${tokenForAllEndpointTest}`)
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ title: '', content: 'This test is automated....!' })
        .end(function (err, res) {
            expect(res).to.have.status(400)
            expect(res.body).to.have.property("message")
            expect(res.body.message).to.equal("'title' value cannot be empty.")
            done()
        })
    })

    it("should not update blog post with missing title key", function(done) {
        chai.request(server)
        .put(`/blogs/update/${blogIdForAllEndpointTest}`)
        .set('Authorization', `Bearer ${tokenForAllEndpointTest}`)
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ content: 'This test is automated....!' })
        .end(function (err, res) {
            expect(res).to.have.status(400)
            expect(res.body).to.have.property("message")
            expect(res.body.message).to.equal("'title' and 'content' keys should be set.")
            done()
        })
    })

    it("should not update blog post with missing content key", function(done) {
        chai.request(server)
        .put(`/blogs/update/${blogIdForAllEndpointTest}`)
        .set('Authorization', `Bearer ${tokenForAllEndpointTest}`)
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ title: 'Unit test edited this' })
        .end(function (err, res) {
            expect(res).to.have.status(400)
            expect(res.body).to.have.property("message")
            expect(res.body.message).to.equal("'title' and 'content' keys should be set.")
            done()
        })
    })

    it("should update blog post with empty content", function(done) {
        chai.request(server)
        .put(`/blogs/update/${blogIdForAllEndpointTest}`)
        .set('Authorization', `Bearer ${tokenForAllEndpointTest}`)
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ title: 'Unit test edited this', content: '' })
        .end(function (err, res) {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property("message")
            expect(res.body.message).to.equal(`Blog post with ID of ${blogIdForAllEndpointTest} is updated.`)
            done()
        })
    })
})

/*

Tests for /blogs/delete:id - Deleting blog post by ID

*/
describe("Deleting post by blog ID Test, /blogs/delete/:id", function() {
    
    before(function(done) {
        if (tokenForAllEndpointTest !== null) {
            return done()
        }
        chai.request(server)
        .post('/login')
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email: process.env.LOGIN_EMAIL, password: process.env.LOGIN_PASSWORD })
        .end(function (err, res) {
            tokenForAllEndpointTest = res.body.token
            done()
        })
    })

    it("should delete blog post after valid authentication", function(done) {
        chai.request(server)
        .delete(`/blogs/delete/${blogIdForAllEndpointTest}`)
        .set('Authorization', `Bearer ${tokenForAllEndpointTest}`)
        .end(function (err, res) {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property("message")
            expect(res.body.message).to.equal(`Blog post with ID of ${blogIdForAllEndpointTest} is deleted.`)
            done()
        })
    })

    it("should not be able to delete blog post without valid authentication", function(done) {
        chai.request(server)
        .delete(`/blogs/delete/${blogIdForAllEndpointTest}`)
        .set('Authorization', '')
        .end(function (err, res) {
            expect(res).to.have.status(401)
            expect(res.body).to.have.property("error")
            expect(res.body.error).to.equal("Auth failed.")
            done()
        })
    })

    it("should not be able to delete blog post without valid blog ID", function (done) {
        chai.request(server)
        .delete(`/blogs/delete/${blogIdForAllEndpointTest}blahblahblah`)
        .set('Authorization', `Bearer ${tokenForAllEndpointTest}`)
        .end(function (err, res) {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property("message")
            expect(res.body.message).to.equal("No matching document.")
            done()
        })
    })
})
