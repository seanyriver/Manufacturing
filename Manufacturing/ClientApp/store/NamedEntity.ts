import UniqueEntity from "./UniqueEntity";

export default interface NamedEntity extends UniqueEntity {
    name: string;
}