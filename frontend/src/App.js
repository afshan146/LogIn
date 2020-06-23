import React from "react";
import { observer } from "mobx-react";
import UserStore from "./store/UserStore";
import LoginForm from "./LoginForm";
import SubmitButton from "./SubmitButton";
import "./App.css";

import { AgGridReact } from "ag-grid-react";
import ColDefinition from "./store/ColDef";
import "ag-grid-community/dist/styles/ag-theme-balham-dark.css";
import "ag-grid-community/dist/styles/ag-grid.css";

class App extends React.Component {

  async componentDidMount() {
    try {
      let res = await fetch("./isLoggedIn", {
        method: "post",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      let result = await res.json();

      if (result && result.success) {
        UserStore.loading = false;
        UserStore.isLoggedIn = true;
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
        AgGridReact.gridApi.refreshCells();
      } else {
        UserStore.loading = false;
        UserStore.isLoggedIn = false;
      }
    } catch (e) {
      UserStore.loading = false;
      UserStore.isLoggedIn = false;
    }
  }

  async doLogout() {
    try {
      let res = await fetch("./logout", {
        method: "post",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      let result = await res.json();

      if (result && result.success) {
        UserStore.isLoggedIn = false;
        UserStore.username = "";
      }
    } catch (e) {
      console.log(e);
    }
  }
  render() {
    if (UserStore.loading) {
      return (
        <div className="app">
          <div className="container">Loading, please wait...</div>
        </div>
      );
    } else {
      if (UserStore.isLoggedIn) {
        return (
          <div className="app">
            <div className="container">
              Welcome {UserStore.username}
              <SubmitButton
                text={"Log out"}
                disabled={false}
                onClick={() => this.doLogout()}
              />

              <div
                className="ag-theme-balham-dark"
                style={{
                  width: '95%',
                  height: 600,
                }}
              >
                <AgGridReact
                  columnDefs={ColDefinition.columnDefs}
                  rowData={ColDefinition.rowData}
                  defaultColDef={ColDefinition.defaultColDef}
                  rowSelection="multiple"
                  onGridReady={(params) => (this.gridApi = params.api)}
                />
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="app">
          <div className="container">
            <LoginForm />

          </div>
        </div>
      );
    }
  }
}

export default observer(App);
