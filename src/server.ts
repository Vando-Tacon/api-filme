import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

// Rota para buscar filmes
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

// Rota para cadastrar um filme
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

// Rota para atualizar um filme
app.put("/movies/:id", async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error("Erro ao atualizar filme:", error);
    res.status(500).send({ message: "Falha ao atualizar o registro" });
  }
});

// Rota para excluir um filme
app.delete("/movies/:id", async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error("Erro ao remover filme:", error);
    res.status(500).send({ message: "Falha ao remover o registro" });
  }
});
