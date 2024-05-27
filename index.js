const express = require("express");

const{Pool} = require("pg");
const { generarReportes } = require("./middleware/generarreportes");
const app = express();


app.listen(3000, () => {
    console.log("Servidor corriendo en el puerto 3000");
})

const pool = new Pool({
    user: "admin",
    host: "localhost",
    database: "joyas",
    password: "admin123",
    allowExitOnIdle: true
})
app.get("/joyas", generarReportes, async (req, res) => {
    try {
        const {limits, page, order_by} = req.query;
        let consultas = ""

        if (order_by) {
            const[campo, ordenamiento] = order_by.split("_");
            consultas += ` ORDER BY ${campo} ${ordenamiento}`}

        if (limits) {
            consultas += ` LIMIT ${limits}`};

        if (page && limits) {
         const offset = (page*limits) - limits; 
         consultas += ` OFFSET ${offset}`};
         const query = `SELECT * FROM inventario ${consultas}`;
         const {rows:data} = await pool.query(query);
         const results = joyas.map(joya => {
            return {
            name: joya.nombre, 
            href: `/joyas/joya/${joya.id}`
         }
        })
        const totalJoyas= joyas.length;
        const stockTotal= joyas.reduce((acumulador, valorActual)=>acumulador + valorActual.stock,0)
        const HATEOAS = {results, totalJoyas, stockTotal}
        res.json(HATEOAS)
    }   catch (error) {
            restart.status(500).send(error)
        }
    })

    app.get("/joyas/joya/ :id", async (req, res) => {
        try{
            const {id} = req.params;
            const query = "SELECT * FROM inventario WHERE id = $1";
            const values = [id];
            const {rows: data} = await pool.query(query, values);
            res.json(data)
        }
        catch(error){
            res.status(500).send(error)
        }
    })
    app.get("/joyas/filtros", async (req, res) => {
        try{
            const {precio_max, precio_min, metal, categoria} = req.query;
            let filtros = [];
            const values = [];
            const agregarAlFiltro = (campo, comparador, valor) => {   
                values.push(valor);
                const posicion =filtros.length + 1;
                filtros.push(`${campo} ${comparador} $${posicion}`);
            }
            if (precio_max) {
                agregarAlFiltro("precio", "<=", precio_max);
            }
             if (precio_min) {
            agregarAlFiltro("precio", ">=", precio_min);
            }
            if (metal) {
            agregarAlFiltro("metal", "=",metal);
            }
            if (categoria) {
            agregarAlFiltro("categoria", "=",categoria);
            }
            const nuevosFiltros = filtros.join(" AND ");
            filtros=  `WHERE ${nuevosFiltros}`
            const query = `SELECT * FROM inventario WHERE ${filtros}`;
            console.log(query,values);
            const {rows: data} = await pool.query(query, values);
            res.json(data)
       
     } catch(error){
            res.status(500).send(error)
        }
    })