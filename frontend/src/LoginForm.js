import React from "react";
import InputField from "./InputField";
import SubmitButton from "./SubmitButton";
import UserStore from "./store/UserStore";

import ColDefinition from "./store/ColDef";
import { AgGridReact } from "ag-grid-react";

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      buttonDisabled: false,
    };
  }

  setInputValue(property, val) {
    val = val.trim();
    if (val.length > 12) {
      return;
    }
    this.setState({
      [property]: val,
    });
  }

  resetForm() {
    this.setState({
      username: "",
      password: "",
      buttonDisabled: false,
    });
  }

  async doLogin() {
    if (!this.state.username) {
      return;
    }
    if (!this.state.password) {
      return;
    }
    this.setState({
      buttonDisabled: true,
    });

    try {
      let res = await fetch("./login", {
        method: "post",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.state.username,
          password: this.state.password,
        }),
      });

      let result = await res.json();
      if (result && result.success) {

        UserStore.username = result.username;
        UserStore.userPriority = result.userPriority;

        //validate ag-grid according to user priority
        if (UserStore.userPriority === 1) {
          ColDefinition.defaultColDef.editable = true;
          ColDefinition.columnDefs[0].checkboxSelection = true;
        }
        else if (UserStore.userPriority === 2) {
          ColDefinition.defaultColDef.editable = false;
          ColDefinition.columnDefs[0].checkboxSelection = false;
        }
        try {
          let resData = await fetch("./getData", {
            method: "post",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
            },
          });

          let resultData = await resData.json();
          if (resultData && resultData.success) {
            ColDefinition.rowData = resultData.rowData;
            console.log("data copied");
            alert(ColDefinition.rowData);
          } else if (resultData && resultData.success === false) {
            alert(resultData.msg);
          }
        }
        catch (e) {
          console.log(e);
        }
        //update form
        UserStore.isLoggedIn = true;
      } else if (result && result.success === false) {
        this.resetForm();
        alert(result.msg);
      }
    } catch (e) {
      console.log(e);
      this.resetForm();
    }
  }
  render() {
    return (
      <div className="loginForm">
        Log in
        <InputField
          type="text"
          placeholder="username"
          value={this.state.username ? this.state.username : ""}
          onChange={(val) => this.setInputValue("username", val)}
        />
        <InputField
          type="password"
          placeholder="Password"
          value={this.state.password ? this.state.password : ""}
          onChange={(val) => this.setInputValue("password", val)}
        />
        <SubmitButton
          text="Login"
          disabled={this.state.buttonDisabled}
          onClick={() => this.doLogin()}
        />
      </div>
    );
  }
}

export default LoginForm;
