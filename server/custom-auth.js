import payload from 'payload';

export default async function customAuth(req, res) {
  const { email, password } = req.body;

  try {
    // Encuentra al usuario
    const user = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
    });

    if (user.docs.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const userData = user.docs[0];

    // Valida la contraseña en texto plano
    if (userData.password === password) {
      // Genera un token de sesión
      const token = await payload.auth.create({
        collection: 'users',
        data: { id: userData.id },
      });

      return res.status(200).json({ token });
    } else {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error interno del servidor', error });
  }
}
