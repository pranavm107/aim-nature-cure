const response = {
  data: {"status":null,"message":null,"statusCode":null,"result":{"id":"a64b62ed-4ea5-406f-9a60-15477011c341","name":"Main Admin","email":"admin@example.com","phone":"1234567890","roleId":"7c6757c9-78f7-4977-a8d4-f1b708c56135","roleName":"ADMIN","role":"ADMIN","photo":null,"active":true,"createdAt":"2026-09-22T20:59:57.631266","updatedAt":"2026-09-22T20:59:57.631266"},"totalElements":0,"noOfElements":0,"noOfPages":0}
};

let ObjectData = response.data;
console.log("Initial ObjectData:", ObjectData);

if (ObjectData.result) ObjectData = ObjectData.result;
console.log("After result unwrap:", ObjectData);

