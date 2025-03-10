import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

app.get("/movies", async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error("Erro ao buscar filmes:", error);
    res.status(500).send({ message: "Erro ao buscar filmes" });
  }
});

app.post("/movies", async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error("Erro ao cadastrar filme:", error);
    res.status(500).send({ message: "Falha ao cadastrar um filme" });
  }
});
