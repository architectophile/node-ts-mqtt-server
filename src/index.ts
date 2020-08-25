import mosca, { Client, Packet } from "mosca";

const settings = {
  port: 1883,
};

const mqtt_server = new mosca.Server(settings);

mqtt_server.on("ready", function () {
  console.log("MQTT broker is ready.");
});

mqtt_server.on("clientConnected", (client: Client) => {
  console.log("on clientConnected called.");
  console.log("client: ", client);
});

mqtt_server.on("published", (packet: Packet, client: Client) => {
  console.log("on published called.");
  console.log("packet: ", packet);
  console.log("client: ", client);
});
