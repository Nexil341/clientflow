import getAllServices from "../models/serviceModel.js";

export default async function getServices(req, res) {
    const services = await getAllServices();

    res.json(services);
}   