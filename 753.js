(state, msg, callback) => {
  log('1.1 identify')

  state.proposalEncoded.in = msg
  state.proposal.in = pbm.Propose.decode(msg)
  const pubkey = state.proposal.in.pubkey

  state.key.remote = crypto.keys.unmarshalPublicKey(pubkey)

  PeerId.createFromPubKey(pubkey.toString('base64'), (err, remoteId) => {
    if (err) {
      return callback(err)
    }

    // If we know who we are dialing to, double check
    if (state.id.remote) {
      if (state.id.remote.toB58String() !== remoteId.toB58String()) {
        return callback(new Error('dialed to the wrong peer, Ids do not match'))
      }
    } else {
      state.id.remote = remoteId
    }

    log('1.1 identify - %s - identified remote peer as %s', state.id.local.toB58String(), state.id.remote.toB58String())
    callback()
  })
}