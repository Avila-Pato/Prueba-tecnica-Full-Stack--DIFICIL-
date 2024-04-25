import express from "express";
import cors from "cors";
import multer from "multer";
import csvToJson from "convert-csv-to-json";
import { json } from "stream/consumers";

// Crear una instancia de la aplicación Express
const app = express();

// Definir el puerto en el que el servidor Express escuchará las solicitudes
// Si la variable de entorno PORT está definida, se utilizará ese valor; de lo contrario, se usará el puerto 3000
const port = process.env.PORT ?? 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let userData: Array<Record<string, string>> = [];

// Aplicar el middleware Cors a todas las rutas de la aplicación
// Esto permite solicitudes desde cualquier origen
app.use(cors());

app.post("/api/files", upload.single("files"), async (req, res) => {
  // 1. extract file from request
  const { file } = req;

  // 2. validate that we have file
  if (!file) {
    return res.status(500).json({
      message: "You must upload a file",
    });
  }

  // 3. validate the mimetype (csv)

  if (file.mimetype !== "text/csv") {
    return res.status(500).json({
      message: "File must be a CSV",
    });
  }

  let json: Array<Record<string, string>> = [];
  try {
    // 4. trasnform the file (Buffer) to string
    const rawCsv = Buffer.from(file.buffer).toString("utf-8");
    console.log(rawCsv);
    // 5. trasnform string (csv) to json
    json = csvToJson.fieldDelimiter(',').csvStringToJson(rawCsv);
  } catch (error) {
    return res.status(500).json({ message: "Error parsing file" });
  }
  // 6. save the json to db (or memory)
  userData = json;
  // 7. return 200 with the message and the JSON
  return res
    .status(200)
    .json({ data: json, message: "El archivo se cargo correctamente" });
});

app.get("/api/users", async (req, res) => {
    // 1. extract the query param 'q' from the request
    const { q } = req.query;
    // 2. validate that we have the query param '
    if (!q) {
        return res.status(500).json({
            message: 'Query param `q` is required,'
        })
    }

    if(Array.isArray(q)) {
        return res.status(500).json({
            message: 'Query param `q` must be a string,'
        })
    }

    // 3. filter the data from the db (or memory) with the query param
    const search = q.toString().toLocaleLowerCase()
    const filteredData = userData.filter(row =>{
       return Object 
        .values(row)
        .some(value => value.toLocaleLowerCase().includes(search))
    })
    // 4. return 200 with the filtered data 
  return res.status(200).json({ data: filteredData });
});

// Iniciar el servidor Express y hacerlo escuchar en el puerto especificado
app.listen(port, () => {
  // Imprimir un mensaje en la consola indicando que el servidor está en funcionamiento
  console.log(`Server is running at  htt://localhost:${port}`);
});
