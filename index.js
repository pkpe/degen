const sdk = require('api')('@tallal-test/v1.0#17j7q2nliotg780');
const discord_key = process.env['discord_key']
const Discord = require('discord.js');

sdk.server('https://api-mainnet.magiceden.dev/v2');

const { Client, Intents, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

function convertData(data) {
    let result = {};

    result['FP SOL'] = data.floorPrice / 1e9;
    result['TOTAL SOL VOL'] = data.volumeAll / 1e9;
    result['LISTED'] = data.listedCount;
    return result;
}

function fetchCollectionSymbolStats() {
  sdk.getCollectionsSymbolStats({symbol: 'degenerate_monkiez'})
    .then(({ data }) => {
      let convertedData = convertData(data);
      console.log(convertedData);
      updateChannelNames(convertedData);
    })
    .catch(err => {
      console.error('Error fetching collection symbol stats:', err);
    });
}

fetchCollectionSymbolStats();
setInterval(fetchCollectionSymbolStats, 60000);

client.login(discord_key).catch(err => {
  console.error('Error logging in to Discord:', err);
});

function updateChannelNames(data) {
  let categoryChannel = client.channels.cache.get('1123173065023553649');
  if (!categoryChannel) {
    console.log('Category channel not found');
    return;
  }

  categoryChannel.setName('Degenerate Monkiez Stats Channel')
    .then(updatedChannel => console.log(`Category channel renamed to ${updatedChannel.name}`))
    .catch(err => {
      console.error('Error renaming category channel:', err);
    });

  // Get a collection of all channels in the category
  let channels = client.channels.cache.filter(channel => channel.parentId === categoryChannel.id);

  // Rename each channel
  channels.each(channel => {
    let newName = '';
    if (channel.id === '1123173170724216842') {
      newName = `FP SOL ${data['FP SOL']}`;
    } else if (channel.id === '1123173244392980522') {
      newName = `TOTAL SOL VOL ${data['TOTAL SOL VOL']}`;
    } else if (channel.id === '1123173319307440219') {
      newName = `LISTED ${data['LISTED']}`;
    }

    if (newName) {
      channel.setName(newName)
        .then(updatedChannel => console.log(`Channel renamed to ${updatedChannel.name}`))
        .catch(err => {
          console.error(`Error renaming channel ${channel.id}:`, err);
        });
    }
  });
}
