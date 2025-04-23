import { berachainClient } from "../../config";
import { TemplatePoolProvider } from "./TemplatePoolProvider";

const stateProvider = new TemplatePoolProvider(berachainClient);

stateProvider.start();
