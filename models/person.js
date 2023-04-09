const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI;

mongoose
  .connect(url)
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const numRegex =
  /^(\d{3}-\d{3}-\d{4}|\d{10}|\(\d{3}\)\s*\d{3}-\d{4}|\d{2}-\d+|\d{3}-\d+)$/;

const numValidator = [
  {
    validator: function (v) {
      return numRegex.test(v);
    },
    message: (props) => `${props.value} is not a valid phone number`,
  },
];

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
  },
  number: {
    type: String,
    minLength: 8,
    validate: numValidator,
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
