import React from "react";
import { Button, Row, Col, AutoComplete, Input } from "antd";
import axios from "axios";
import "antd/dist/antd.css";
import "./App.css";

const API_HOST = "https://my-vocabulary-deploy.azurewebsites.net";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ruWord: "",
      engWord: "",
      items: [],
      sourceItems: [],
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleChangeAc = this.handleChangeAc.bind(this);
    this.saveToVocabulary = this.saveToVocabulary.bind(this);
  }

  

  componentDidMount() {
    fetch(`${API_HOST}/api/v2/vocabulary`)
      .then((res) => res.json())
      .then(
        (result) => {
          const uniqueTags = [];
          result.map((elem) => {
            if (uniqueTags.indexOf(elem.engWord) === -1) {
              uniqueTags.push(elem);
            }
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
          });
        },
        // Примечание: важно обрабатывать ошибки именно здесь, а не в блоке catch(),
        // чтобы не перехватывать исключения из ошибок в самих компонентах.
        (error) => {
          this.setState({
            isLoaded: true,
            error,
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

  saveToVocabulary(wordInEnglish, wordInRussian) {
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
          <Row gutter={[48, 48]}>
            <Col span={12}>
              <AutoComplete
                name="enWord"
                style={{
                  width: 300,
                  left: -330,
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
                style={{ width: 300 }}
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
        </div>
      </div>
    );
  }
}

export default App;
