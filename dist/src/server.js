"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("../swagger.json"));
const port = 3000;
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
// Rota para buscar filmes
app.get("/movies", async (req, res) => {
    try {
        const movies = await prisma.movie.findMany({
            orderBy: {
                title: "asc",
            },
            include: {
                genres: true, // Certifique-se de que `genres` é o nome correto no Prisma
                languages: true,
            },
        });
        res.json(movies);
    }
    catch (error) {
        console.error("Erro ao buscar filmes:", error);
        res.status(500).send({ message: "Erro ao buscar filmes" });
    }
});
// Rota para cadastrar um filme
app.post("/movies", async (req, res) => {
    const { title, genre_id, language_id, oscar_count, release_date } = req.body;
    try {
        const movieWithSameTitle = await prisma.movie.findFirst({
            where: {
                title: { equals: title, mode: "insensitive" },
            },
        });
        if (movieWithSameTitle) {
            res.status(409).send({ message: "Já existe um filme com esse título" });
            return;
        }
        await prisma.movie.create({
            data: {
                title,
                genre_id: Number(genre_id),
                language_id: Number(language_id),
                oscar_count: Number(oscar_count),
                release_date: new Date(release_date),
            },
        });
        res.status(201).send({ message: "Filme cadastrado com sucesso!" });
    }
    catch (error) {
        console.error("Erro ao cadastrar filme:", error);
        res.status(500).send({ message: "Falha ao cadastrar um filme" });
    }
});
// Rota para atualizar um filme
app.put("/movies/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const movie = await prisma.movie.findUnique({
            where: { id: Number(id) },
        });
        if (!movie) {
            res.status(404).send({ message: "Filme não encontrado" });
            return;
        }
        const data = { ...req.body };
        if (data.release_date) {
            data.release_date = new Date(data.release_date);
        }
        await prisma.movie.update({
            where: { id: Number(id) },
            data,
        });
        res.status(200).send({ message: "Filme atualizado com sucesso!" });
    }
    catch (error) {
        console.error("Erro ao atualizar filme:", error);
        res.status(500).send({ message: "Falha ao atualizar o registro" });
    }
});
// Rota para excluir um filme
app.delete("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
        const movie = await prisma.movie.findUnique({
            where: { id },
        });
        if (!movie) {
            res.status(404).send({ message: "Filme não encontrado" });
            return;
        }
        await prisma.movie.delete({ where: { id } });
        res.status(200).send({ message: "Filme removido com sucesso" });
    }
    catch (error) {
        console.error("Erro ao remover filme:", error);
        res.status(500).send({ message: "Falha ao remover o registro" });
    }
});
app.get("/movies/genre/:genderName", async (req, res) => {
    try {
        const { genderName } = req.params;
        const moviesFilteredByGenderName = await prisma.movie.findMany({
            include: {
                genres: true,
                languages: true,
            },
            where: {
                genres: {
                    name: {
                        equals: genderName,
                        mode: "insensitive",
                    },
                },
            },
        });
        res.status(200).json(moviesFilteredByGenderName);
    }
    catch (error) {
        console.error("Erro ao filtrar filmes por gênero:", error);
        res.status(500).send({ message: "Falha ao filtrar filmes por gênero" });
    }
});
