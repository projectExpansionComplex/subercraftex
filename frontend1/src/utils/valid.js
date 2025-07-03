const valid = ({ fullname, username, email, password, cf_password }) => {
  const err = {};
  if (!fullname) {
    err.fullname = "Please add your full name.";
  } else if (fullname.length > 25) {
    err.fullname = "Full name must be up to 25 characters long";
  }

  if (!username) {
    err.username = "Please add your username.";
  } else if (username.toLowerCase().replace(/ /g, "").length > 25) {
    err.username = "username must be up to 25 characters long";
  }

  if (!email) {
    err.email = "Please add your email.";
  } else if (!checkEmailValidity(email)) {
    err.email = "Email format is incorrect";
  }

  if (!password) {
    err.password = "Please add your password.";
  } else if (password.length < 6) {
    err.password = "Password must be atleast 6 characters";
  }

  if (cf_password !== password) {
    err.cf_password = "Confirm Password did not match";
  }

  return {
    errMsg: err,
    errLength: Object.keys(err).length,
  };
};

const checkEmailValidity = (email) => {
  // don't remember from where i copied this code, but this works.
  let re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return re.test(email);
};

export default valid;
