import { Projeto } from "./Projeto";

export interface User {
    idUser?: string;
    nome: string;
    email: string;
    senha: string;

    meusProjetos: Array<Projeto>;
    projetosCompartilhados: Array<Projeto>;
}
