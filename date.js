// didnt add () after function because it will call or activate the function.
exports.getDate = function() {

  const today = new Date();

  const options =  {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  const day = today.toLocaleDateString("en-US", options);

  return day;

}
