const { axiosInstance } = require("../../axiosInstance/axiosInstance");

const getURLData = async (req, res) => {
  try {
    const response = await axiosInstance.get("/users");
    console.log("DAta: ", response.data)

    if (!response) {
      return res.status(404).json({ status: false, message: "Data not found" });
    }

    const data = response.data
        console.log("response: ", data)


    return res
      .status(200)
      .json({ status: true, message: "Getting all data",  data });
  } catch (error) {
    console.log("Error Occured", error.message);
    return res
      .status(500)
      .json({ status: false, message: `error occured : ${error.message}` });
  }
};

module.exports = {
  getURLData,
};
