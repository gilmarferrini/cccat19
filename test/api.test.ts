import axios from "axios";

axios.defaults.validateStatus = function () {
  return true;
}

test("Deve criar uma conta de passageiro", async function () {
  const input = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    isPassenger: true
  }
  const responseSignup = await axios.post("http://localhost:3000/signup", input);
  expect(responseSignup.status).toBe(200);
  const outputSignup = responseSignup.data;
  const responseGetAccount = await axios.get(`http://localhost:3000/accounts/${outputSignup.accountId}`);
  const outputGetAccount = responseGetAccount.data;
  expect(outputSignup.accountId).toBeDefined();
  expect(outputGetAccount.name).toBe(input.name);
  expect(outputGetAccount.email).toBe(input.email);
  expect(outputGetAccount.cpf).toBe(input.cpf);
  expect(outputGetAccount.password).toBe(input.password);
  expect(outputGetAccount.is_passenger).toBe(input.isPassenger);
});

test("Não deve criar uma conta de passageiro com o nome inválido", async function () {
  const input = {
    name: "John",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    isPassenger: true
  }
  const responseSignup = await axios.post("http://localhost:3000/signup", input);
  expect(responseSignup.status).toBe(422);
  const outputSignup = responseSignup.data;
  expect(outputSignup.message).toBe("Invalid name");
});