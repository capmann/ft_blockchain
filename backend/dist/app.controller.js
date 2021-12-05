"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const app_service_1 = require("./app.service");
const { default: axios } = require('axios');
const FormDatas = require('form-data');
const smartContractId = "sc_7a62a7796c8c4c96bee827246e813a96";
const starton = axios.create({
    baseURL: "https://api-connect.starton.io/v1",
    headers: {
        "x-api-key": "pk_a0daa5dd9a124b2c86abee23a2101f55",
    },
});
const pinata = axios.create({
    baseURL: "https://api.pinata.cloud/",
    headers: {
        pinata_api_key: "c3e038cfb56016baeddc",
        pinata_secret_api_key: "4570d1f1bac97b692a919d157c282b6cfd56c67241c0e382d0d71a852588315c"
    },
});
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getHello() {
        return this.appService.getHello();
    }
    async uploadMusic(music) {
        console.log(music);
        const supplyResponse = await starton.post(`/smart-contract/${smartContractId}/read`, {
            functionName: 'totalSupply',
            params: []
        });
        const supply = supplyResponse.data.response;
        let data = new FormDatas();
        data.append('file', music.buffer, `music_${supply}.mp3`);
        const ifpsImg = await pinata.post("/pinning/pinFileToIPFS", data, {
            maxBodyLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            }
        });
        const ifpsJson = await pinata.post("/pinning/pinJSONToIPFS", {
            pinataContent: {
                "name": `Music NFT #${supply}`,
                "description": `Description`,
                "image": `ipfs://ipfs/${ifpsImg.data.IpfsHash}`,
                "attributes": [
                    {
                        "key": "credit",
                        "trait_type": "string",
                        "value": "Blockchain API lovingly delivered by https://starton.io"
                    },
                ]
            },
            pinataMetadata: {
                name: `nft_${supply}.json`
            }
        });
        const nft = await starton.post(`/smart-contract/${smartContractId}/interact`, {
            functionName: 'safeMint',
            params: [
                '0xa5e6059264BeC83687a32cb1ECbE64D19231829f',
                ifpsJson.data.ipfsHash
            ],
        });
        console.log(nft.data);
        return { data: nft.data };
    }
};
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "uploadMusic", null);
AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
exports.AppController = AppController;
//# sourceMappingURL=app.controller.js.map