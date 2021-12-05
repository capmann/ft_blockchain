import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
const { default: axios } = require('axios')
const FormDatas = require('form-data')

const smartContractId = "sc_7a62a7796c8c4c96bee827246e813a96"

/**
 * Init Starton, Pinata
 */
  const starton = axios.create({
  baseURL: "https://api-connect.starton.io/v1",
  headers: {
    "x-api-key": "pk_a0daa5dd9a124b2c86abee23a2101f55",
    },
  }
)
const pinata = axios.create({
  baseURL: "https://api.pinata.cloud/",
  headers: {
      pinata_api_key: "c3e038cfb56016baeddc",
      pinata_secret_api_key: "4570d1f1bac97b692a919d157c282b6cfd56c67241c0e382d0d71a852588315c"
  },
})

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMusic(@UploadedFile() music: Express.Multer.File) : Promise<any> {
    console.log(music)
    /**
     * Fetch the current nft supply
     */
    const supplyResponse = await starton.post(`/smart-contract/${smartContractId}/read`, {
      functionName: 'totalSupply',
      params: []
    })
    const supply = supplyResponse.data.response

    let data = new FormDatas();
    data.append('file', music.buffer, `music_${supply}.mp3`)
    
    /**
     * Upload image to IPFS
     */
    const ifpsImg = await pinata.post("/pinning/pinFileToIPFS", data, {
      maxBodyLength: 'Infinity',
          headers: {
              'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
          }
    })
    /**
     * Store json to IPFS
     */
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
    })
    const nft = await starton.post(`/smart-contract/${smartContractId}/interact`, {
      functionName: 'safeMint',
      params: [
          '0xa5e6059264BeC83687a32cb1ECbE64D19231829f',
          ifpsJson.data.ipfsHash
      ],
    })
    console.log(nft.data)
    return {data: nft.data }
  }
}
