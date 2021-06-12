import React from "react";
import { Button, Row, Col, AutoComplete, Input, Table } from "antd";
import axios from "axios";
import "antd/dist/antd.css";
import "./App.css";

const API_HOST = "https://my-vocabulary-deploy.azurewebsites.net";
const COLUMN_WIDTH = 350;
const FIELD_WIDTH = 350;

const columns = [
  {
    title: 'Eng',
    dataIndex: 'engWord',
    key: 'engWord',
    width: COLUMN_WIDTH
  },
  {
    title: 'Rus',
    dataIndex: 'rusWord',
    key: 'rusWord',
    width: COLUMN_WIDTH
  },
];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ruWord: "",
      engWord: "",
      items: [],
      sourceItems: [],
      loading: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeAc = this.handleChangeAc.bind(this);
    this.saveToVocabulary = this.saveToVocabulary.bind(this);
  }

  

  componentDidMount() {
    this.setState({
      loading: true
    });
    fetch(`${API_HOST}/api/v2/vocabulary`)
      .then((res) => res.json())
      .then(
        (result) => {
          const uniqueTags = [];
          result.map((elem) => {
              if (uniqueTags.indexOf(elem.engWord) === -1) {
                uniqueTags.push(elem);
              }
              return elem;
            });
          var options = uniqueTags;
          console.log(options);
          const opts = options.map((item) => {
            return { value: item.engWord };
          });
          this.setState({
            sourceItems: options,
            isLoaded: true,
            items: opts,
            loading: false
          });
        },
        // Примечание: важно обрабатывать ошибки именно здесь, а не в блоке catch(),
        // чтобы не перехватывать исключения из ошибок в самих компонентах.
        (error) => {
          this.setState({
            isLoaded: true,
            error,
            loading: false,
          });
        }
      );
  }

  handleChangeAc(event) {
    this.setState({
      autoCompleteField: event,
      engWord: event,
      ruWord: this.state.sourceItems.find((x) => x.engWord === event)?.rusWord,
    });
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  }

  saveToVocabulary() {
    axios
      .post(`${API_HOST}/api/v2/vocabulary`, {
        vocabularyElement: {
          rusWord: this.state.ruWord,
          engWord: this.state.engWord,
        },
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  render() {
    return (
      <div className="App">
        <div className="App-content">
          <Row justify="space-around" align="middle">
            <Col span={12} width={400} flex={1}>
              <AutoComplete
                name="enWord"
                style={{
                  width: FIELD_WIDTH,
                }}
                options={this.state.items}
                placeholder="try to type any word"
                filterOption={(inputValue, option) =>
                  option.value
                    .toUpperCase()
                    .indexOf(inputValue.toUpperCase()) !== -1
                }
                onChange={this.handleChangeAc}
              />
            </Col>
            <Col span={12}>
              <Input
                name="ruWord"
                placeholder="Russian translation"
                style={{ width: FIELD_WIDTH }}
                onChange={this.handleChange}
                value={this.state.ruWord}
              />
            </Col>

            <Col span={12}>
              <Button
                type="primary"
                style={{ display: "inline-block" }}
                onClick={this.saveToVocabulary}
              >
                Add
              </Button>
            </Col>
          </Row>
          <br/>
          <div style={{backgroundColor: "whitesmoke"}}>
        <Table 
          {...this.state}
          dataSource={this.state.sourceItems} columns={columns}
          pagination={{ pageSize: 20 }} width={2.4*COLUMN_WIDTH}
          bordered={true} />
        </div>
        </div>
      </div>
    );
  }
}

export default App;
