import { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
  const [notification, setNotification] = useState(""); // New state for notification

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/persons")
      .then((response) => {
        setPersons(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data", error);
      });
  }, []);

  //搜索
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  // Filter persons based on search term
  const filteredPersons = persons.filter(
    (person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.number.includes(searchTerm)
  );
  //通知
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification("");
    }, 10000); // Clear notification after 3 seconds
  };
  // 添加
  const handleSubmit = (event) => {
    event.preventDefault();
    // 判断名字是否已存在，如果已存在，则覆盖
    const existingPerson = persons.find((person) => person.name === newName);
    console.log(existingPerson);
    if (existingPerson) {
      if (window.confirm("Are you sure you want to update this person?")) {
        const updatedPerson = { ...existingPerson, number: newNumber };
        axios
          .post("https://phonebook.midday.top/api/persons", updatedPerson)
          .then((response) => {
            setPersons(
              persons.map((person) =>
                person.id === existingPerson.id ? response.data : person
              )
            );
            setNewName("");
            setNewNumber("");
            showNotification("Person updated successfully!");
          })
          .catch((error) => {
            if (error.response && error.response.status === 400) {
              showNotification(error.response.data.error);
            }
            // } else if (error.response && error.response.status === 404) {
            //   showNotification(
            //     `${existingPerson.number} of ${existingPerson.name} has been removed`
            //   );
            // }
            console.error("Error updating person", error);
          });
      }
    } else {
      // 添加新名字
      const newPerson = {
        name: newName,
        number: newNumber,
        id: (Math.floor(Math.random() * 10000) + 1).toString(),
      };
      axios
        .post("http://localhost:3001/api/persons", newPerson)
        .then((reponse) => {
          setPersons(persons.concat(reponse.data));
          setNewName("");
          setNewNumber("");
          showNotification("Person added successfully!");
        })
        .catch((error) => {
          if (error.response && error.response.status === 400) {
            showNotification(error.response.data.error);
          }
          console.error("Error adding person", error);
        });
    }
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "name") {
      setNewName(value);
    } else if (name === "number") {
      setNewNumber(value);
    }
  };

  //删除
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this person?")) {
      axios
        .delete(`http://localhost:3001/api/persons/${id}`)
        .then(() => {
          setPersons(persons.filter((person) => person.id !== id));
          showNotification("Person deleted successfully!"); // Show notification
        })
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            const removedPerson = persons.find((person) => person.id === id);
            showNotification(
              `${removedPerson.number} of ${removedPerson.name} has been removed`
            );
          } else {
            console.error("Error deleting person", error);
          }
        });
    }
  };
  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h1 style={{ color: "#333", fontSize: "2em", marginBottom: "20px" }}>
        PhoneBook
      </h1>
      {notification && (
        <div style={{ color: "red", marginBottom: "20px" }}>{notification}</div>
      )}
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearchChange}
        style={{
          padding: "10px",
          width: "100%",
          marginBottom: "20px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div>
          <input
            name="name"
            value={newName}
            onChange={handleInputChange}
            placeholder="Name"
            style={{
              padding: "10px",
              width: "calc(50% - 10px)",
              marginRight: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <input
            name="number"
            value={newNumber}
            onChange={handleInputChange}
            placeholder="Number"
            style={{
              padding: "10px",
              width: "calc(50% - 10px)",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              marginTop: "10px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#28a745",
              color: "white",
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>
      </form>
      <h2 style={{ color: "#333", marginBottom: "10px" }}>Numbers</h2>
      <ul style={{ listStyleType: "none", padding: "0" }}>
        {filteredPersons.map((person, index) => (
          <li
            key={index}
            style={{
              marginBottom: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {`${person.name} ${person.number}`}
            <button
              onClick={() => handleDelete(person.id)}
              style={{
                padding: "5px 10px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "#dc3545",
                color: "white",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default App;
