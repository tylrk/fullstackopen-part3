const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

app.use(express.json());
app.use(express.static('build'));
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :data"));
app.use(cors());

morgan.token('data', (request, response) => {
    return JSON.stringify(request.body)
})

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Phonebook Landing Page</h1>");
});

app.get("/info", (request, response) => {
  const date = new Date();

  response.send(
    `<p>Phonebook has info for ${persons.length} people</p>
     <p>${date}</p>`
  );
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  person
    ? response.json(person)
    : response.status(404).send("Person does not exist");
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

const generateId = () => {
  const currentIds = persons.map((person) => person.id);
  let newId;
  do {
    newId = Math.floor(Math.random() * 1000) + 1;
  } while (currentIds.includes(newId));

  return newId;
};

app.post("/api/persons", (request, response) => {
  const body = request.body;
  const names = persons.map((person) => person.name);

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  if (!body.name) {
    return response.status(400).json({
      error: "name missing",
    });
  } else if (!body.number) {
    return response.status(400).json({
      error: "number missing",
    });
  } else if (names.includes(person.name)) {
    return response.status(400).json({
      error: "name already exists",
    });
  }

  persons = persons.concat(person);

  response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
