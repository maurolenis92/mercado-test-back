const express = require('express');
const axios = require('axios'); // Agrega axios para realizar solicitudes HTTP
const app = express();
const port = 3000;

app.use(express.json());

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Datos del autor
const author = {
    name: 'Mauricio',
    lastname: 'Lenis',
};

// Endpoint para obtener una lista de items basados en un query (categoría o nombre)
app.get('/api/items', async (req, res) => {
    const query = req.query.q;
    try {
        const response = await axios.get(`https://api.mercadolibre.com/sites/MLA/search?q=${query}`);
        const items = response.data.results.map((item) => ({
            id: item.id,
            title: item.title,
            price: {
                currency: item.currency_id,
                amount: item.price,
                decimals: 2, // Puedes ajustar esto según tus necesidades
            },
            picture: item.thumbnail,
            condition: item.condition,
            free_shipping: item.shipping.free_shipping,
            address_state_name: item.address.state_name
        }));

        const categories = response.data.filters
            .find((filter) => filter.id === 'category')
            .values[0].path_from_root.map((category) => category.name);

        const responseData = {
            author,
            categories,
            items,
        };

        res.json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la lista de items' });
    }
});

// Endpoint para obtener la información de un item por ID
app.get('/api/items/:id', async (req, res) => {
    const itemId = req.params.id;
    try {
        const itemResponse = await axios.get(`https://api.mercadolibre.com/items/${itemId}`);
        const descriptionResponse = await axios.get(`https://api.mercadolibre.com/items/${itemId}/description`);

        const item = itemResponse.data;
        const description = descriptionResponse.data.plain_text;

        const responseData = {
            author,
            item: {
                id: item.id,
                title: item.title,
                price: {
                    currency: item.currency_id,
                    amount: item.price,
                    decimals: 2, // Puedes ajustar esto según tus necesidades
                },
                picture: item.pictures[0].url,
                condition: item.condition,
                free_shipping: item.shipping.free_shipping,
                sold_quantity: item.sold_quantity,
                description,
            },
        };

        res.json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la información del item' });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});