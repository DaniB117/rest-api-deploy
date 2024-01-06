const express = require('express')
const crypto = require('node:crypto')
const movies = require('./movies.json')
const cors = require('cors')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

const app = express()
app.use(express.json())

app.use(cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        'http://localhost:8080',
        'http://localhost:1234',
        'https://movies.com',
        'https://midu.dev'
      ]
  
      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }
  
      if (!origin) {
        return callback(null, true)
      }
  
      return callback(new Error('Not allowed by CORS'))
    }
}))

app.disable('x-powered-by')

app.get('/', (req, res) =>{
    res.json({message: "hola mundo"})
})
//app.use((req, res, next) => {
//    res.header('Access-Control-Allow-Origin', '*');
//    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Permitir los métodos GET, POST, PUT, DELETE
//    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Permitir acceso desde cualquier origen (*), o puedes especificar un dominio específico
//    res.header('Referrer-Policy', 'unsafe-url'); // Permitir enviar el referrer incluso a través de peticiones desde HTTPS a HTTP
    // Otros encabezados CORS que desees configurar...
//   next();
//});

app.get('/movies',(req, res) =>{
//    const origin = req.header('origin')
//    if (ACCEPTED_ORIGINS.includes(origin) || !origin){
//        res.header('Access-Control-Allow-Origin', 'origin');
//    }
    
    const { genre } = req.query
    if (genre) {
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
})

app.get('/movies/:id', (req, res) => {
    const { id } = req.params
    const movie = movies.find( movie => movie.id === id)
    if (movie) return res.json(movie)

    res.status(404).json({ message: 'Movie not found' })
}) 
//se puede usar path-to-regexp

app.post('/movies', (req,res) => {

    const result = validateMovie(req.body)

    if (!result.success){
        return res.status(400).json({ error: JSON.parse( result.error.message )})
    }

    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    }

    movies.push(newMovie)

    res.status(201).json(newMovie)
})

app.delete('/movies/:id',(req, res) => {
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' })
    }
    movies.splice(movieIndex, 1)

    return res.json({ message: 'Movie deleted'})
})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.json(updateMovie)

})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
    console.log(`server lisening on port http://localhost:${PORT}`)
})