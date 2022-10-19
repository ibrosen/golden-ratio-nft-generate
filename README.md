# cc0-mashup

# Setup

## Generate the correctly sized images

The `/original-layers` folder contains all the original layers for the various projects. They've been kept as is in order to give us the most flexibility as we generate images, allowing us to pick different output sizes easily.

Run the below command to take all of these original layers and resize them all to be the correct size and format, ready for use in the generation engine. The command also sets up the required folder structure

```
yarn setup
```

## Generating

To generate the assets, we use a seeded RNG approach. We only need our RNG here to be "good enough", as the contract is responsible for ensuring there's no way of knowing which NFT will have which metadata.

### Metadata

```
yarn generate --metadata

```

### Images

```
yarn generate --images

```

## Yarn PnP

If using Yarn PnP in VSCode, click "Allow" on the prompt that asks if you wish to use the workspace's version of Typescript
