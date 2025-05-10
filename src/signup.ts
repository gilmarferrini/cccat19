import crypto from "crypto";
import pgp from "pg-promise";
import express from "express";
import { validateCpf } from "./validateCpf";

const app = express();
app.use(express.json());

function isValidName(name: string) {
  return name.match(/[a-zA-Z] [a-zA-Z]+/)
}

function isValidEmail(email: string) {
  return email.match(/^(.+)@(.+)$/)
}

function isValidCarPlate(plate: string) {
  return plate.match(/[A-Z]{3}[0-9]{4}/)
}

app.post("/signup", async function (req, res) {
	const input = req.body;
	const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
	try {
		const id = crypto.randomUUID();
		const [existingAccount] = await connection.query("select * from ccca.account where email = $1", [input.email]);
    if (existingAccount) throw new Error("Account already exists");
    if (!isValidName(input.name)) throw new Error("Invalid name");
    if (!isValidEmail(input.email)) throw new Error("Invalid email");
    if (!validateCpf(input.cpf)) throw new Error("Invalid CPF");
    if (input.isDriver && !isValidCarPlate(input.carPlate)) throw new Error("Invalid car plate");
    await connection.query("insert into ccca.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver, password) values ($1, $2, $3, $4, $5, $6, $7, $8)", [id, input.name, input.email, input.cpf, input.carPlate, !!input.isPassenger, !!input.isDriver, input.password]);
    res.json({ accountId: id });
	} catch (error: any) {
    return res.status(422).json({ message: error.message });
  }
  finally {
		await connection.$pool.end();
	}
});

app.get('/accounts/:accountId', async function (req, res) {
  const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
  const id = req.params.accountId;
  const [acc] = await connection.query("select * from ccca.account where account_id = $1", [id]);
  await connection.$pool.end();
  return res.json(acc);
});

app.listen(3000);