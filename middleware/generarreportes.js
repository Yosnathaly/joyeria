const generarReportes = (req, res, next) => {
    const url = req.url;
    const query = req.query;
    console.log (`se ha solicitado la url: ${url}, con la siguiente query: ${query}`);
    next();}

module.exports = {generarReportes}