router.get('/', async (req, res) => {
  const userId = req.user.id;
  const boards = await getBoardsForUser(userId);
  res.render('dashboard', { boards });
});

