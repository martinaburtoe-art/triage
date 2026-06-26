// src/lib/patients.ts

// Tipos estrictos para evitar errores de escritura ("typos") en la base de datos
export type Sexo = "Masculino" | "Femenino" | "Otro";
export type Prevision =
  | "Fonasa Tramo A"
  | "Fonasa Tramo B"
  | "Fonasa Tramo C"
  | "Fonasa Tramo D"
  | "Isapre Consalud"
  | "Isapre Banmédica"
  | "Isapre Colmena"
  | "Isapre CruzBlanca"
  | "Particular";

// Definimos qué forma tiene un "Paciente" usando nuestros tipos estrictos
export interface Patient {
  rut: string;
  nombre: string;
  edad: number;
  sexo: Sexo;
  prevision: Prevision | string; // Permitimos string en caso de otras Isapres
}

// Creamos nuestra base de datos simulada
export const patientDatabase: Patient[] = [
  {
    rut: "12345678-5", // RUT válido
    nombre: "María Fernanda González",
    edad: 34,
    sexo: "Femenino",
    prevision: "Fonasa Tramo C",
  },
  {
    rut: "9876543-3", // ¡Este era el de 8 dígitos! Su dígito real es 3
    nombre: "Juan Pérez Silva",
    edad: 45,
    sexo: "Masculino",
    prevision: "Isapre Consalud",
  },
  {
    rut: "19283746-4", // RUT válido
    nombre: "Camila Andrea Rojas Muñoz",
    edad: 28,
    sexo: "Femenino",
    prevision: "Fonasa Tramo B",
  },
  {
    rut: "8123456-6", // Otro de 8 dígitos válido
    nombre: "Pedro Antonio Soto Valdés",
    edad: 67,
    sexo: "Masculino",
    prevision: "Fonasa Tramo D",
  },
  {
    rut: "25456789-2", // RUT válido
    nombre: "Lucas Mateo Herrera Díaz",
    edad: 8,
    sexo: "Masculino",
    prevision: "Isapre Banmédica",
  },
  {
    rut: "11111899-K", // RUT válido con 'K' para que pruebes tu sistema
    nombre: "Valentina Sofía Castro López",
    edad: 41,
    sexo: "Femenino",
    prevision: "Isapre Colmena",
  },
];
