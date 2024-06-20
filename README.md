# Seeder-node
A credit lending platform.
Developed Backend Endpoints using NodeJs
## BE ENDPOINTS FOR SEEDER
* POST /user
```
{
 "id": 12345,
"name": "Afreen",
"email":"Afreen@gmail.com",

}
```
* PATCH /user/{id}
```
{
"name": "Afreen",
"email":"Afreen@gmail.com",

}
```
* GET /user?email={email}
```
{
 "id": 12345,
"name": "Afreen",
"email":"Afreen@gmail.com",
"credit_balance": 1800000,
"rate": 12,
"term_cap": 12
},
```
* POST /cashkick
```
{
 "id": 12345,
 "name": "Business Name 1",
  "status": "Active",
  "maturity": "2024-12-31",
  "total_received": 100000.00,
"user_id": 1,
"contract_ids": [1,2,3,4]
}
```
* GET /cashkick/{userId}
```
{
 "id": 12345,
 "name": "Business  Name1",
  "status": "Active",
  "maturity": "2024-12-31",
  "total_received": 100000.00,
  "total_financed": 50000.00
}
```
* GET /contract
```
[
 {
  "id": 12345,
  "name": "Loan-001",
  "type": "Monthly",
  "status": "Active",
  "per_payment": 1000,
  "term_length": 12 ,
"payment_amount":12000
 }
]
```
* POST /contract
```
{
  "id": 12345,
  "name": "Loan-001",
  "type": "Monthly",
  "status": "Active",
  "per_payment": 1000,
  "term_length": 12 ,
"payment_amount":12000,
 }
```