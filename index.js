require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
const { request } = require("https");

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message })
  }

  next(error);
};

app.use(express.json());
app.use(express.static("build"));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :data")
);
app.use(cors());

morgan.token("data", (request, response) => {
  return JSON.stringify(request.body);
});

let persons = [];

app.get("/", (request, response) => {
  response.send("<h1>Phonebook Landing Page</h1>");
});

app.get("/info", (request, response) => {
  const date = new Date();

  Person.count({})
    .then((count) => {
      response.send(
        `<p>Phonebook has info for ${count} people</p>
      <p>${date}</p>`
      );
    })
    .catch((error) => next(error));
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;
  const names = persons.map((person) => person.name);

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  if (body.name === undefined) {
    return response.status(400).json({
      error: "name missing",
    });
  } else if (body.number === undefined) {
    return response.status(400).json({
      error: "number missing",
    });
  }

  person.save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch(error => next(error))
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
