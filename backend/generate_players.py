import random
from datetime import datetime, timedelta

first_names = ["Miguel", "Jose", "Juan", "Carlos", "Luis", "Pedro", "Jesus", "Angel", "David", "Diego", "Gabriel", "Samuel", "Alejandro", "Daniel", "Santiago", "Sebastian", "Matias", "Nicolas", "Lucas", "Mateo", "Leonardo", "Eduardo", "Javier", "Manuel", "Antonio", "Francisco", "Ricardo", "Fernando", "Jorge", "Roberto"]
last_names = ["Perez", "Garcia", "Rodriguez", "Hernandez", "Martinez", "Lopez", "Gonzalez", "Diaz", "Sanchez", "Ramirez", "Torres", "Flores", "Rivera", "Gomez", "Murillo", "Castillo", "Jimenez", "Vargas", "Rojas", "Romero", "Mendoza", "Moreno", "Alvarez", "Ruiz", "Gutierrez", "Silva", "Castro", "Ortiz", "Nunez"]

def generate_cedula():
    return f"V-{random.randint(20000000, 35000000)}"

def generate_date_of_birth():
    start_date = datetime(2005, 1, 1)
    end_date = datetime(2018, 12, 31)
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    return (start_date + timedelta(days=random_number_of_days)).strftime("%Y-%m-%d")

sql_statements = []

for i in range(60):
    f_name1 = random.choice(first_names)
    f_name2 = random.choice(first_names) if random.random() > 0.5 else ""
    l_name1 = random.choice(last_names)
    l_name2 = random.choice(last_names)
    
    dob = generate_date_of_birth()
    cedula = generate_cedula()
    phone = f"04{random.choice(['12', '14', '16', '24', '26'])}-{random.randint(1000000, 9999999)}"
    

    # Escape simple quotes just in case, though these names are safe
    sql = f"INSERT INTO jugadores (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, fecha_nacimiento, cedula, telefono_contacto, direccion, representante_nombre, representante_cedula, representante_telefono, tipo_sangre, activo) VALUES ('{f_name1}', '{f_name2}', '{l_name1}', '{l_name2}', '{dob}', '{cedula}', '{phone}', 'Valencia, Carabobo', 'Representante {l_name1}', 'V-{random.randint(5000000, 15000000)}', '{phone}', '{random.choice(['O+', 'A+', 'B+', 'O-'])}', 1);"
    sql_statements.append(sql)

# Generate Personal (Staff)
cargos = ["Entrenador", "Asistente", "Fisioterapeuta", "Delegado", "Administrativo"]
for i in range(10):
    f_name = random.choice(first_names)
    l_name = random.choice(last_names)
    cargo = random.choice(cargos)
    phone = f"04{random.choice(['12', '14', '16', '24', '26'])}-{random.randint(1000000, 9999999)}"
    
    sql = f"INSERT INTO personal (nombre, apellido, cargo, telefono, activo) VALUES ('{f_name}', '{l_name}', '{cargo}', '{phone}', 1);"
    sql_statements.append(sql)

# Generate Extra Users (Using bcrypt hash of 'password')
# $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi is 'password'
default_pass = "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"
sql_statements.append(f"INSERT INTO users (username, password, role) VALUES ('entrenador', '{default_pass}', 'user');")
sql_statements.append(f"INSERT INTO users (username, password, role) VALUES ('secretaria', '{default_pass}', 'user');")

print("\n".join(sql_statements))
