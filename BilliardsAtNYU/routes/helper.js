function renderWithUser(req, res, route, data) {
  if (!data) {
    data = {};
  }
  console.log("User: " + req.user);
  if (req.user) {
    data.user = req.user;
    if (data.user.labels.indexOf("Admin") != -1) {
      data.admin = true;
    }
  }
  //console.log(data);
  res.render(route, data);
}

helper = {};

helper.renderWithUser = renderWithUser;

module.exports = helper;