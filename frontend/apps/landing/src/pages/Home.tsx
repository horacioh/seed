import * as stylex from '@stylexjs/stylex'
import React from 'react'
import Collaboration from '../components/Collaboration'
import Community from '../components/Community'
import GetStarted from '../components/GetStarted'
import Hero from '../components/Hero'
import Identity from '../components/Identity'
import Linking from '../components/Linking'
import Protocol from '../components/Protocol'
import Publishing from '../components/Publishing'
import Footer from '../layout/Footer'
import Navbar from '../layout/Navbar'
const styles = stylex.create({
  s65fb2a7: {
    paddingTop: 'calc(0.25rem * 20)',
  },
})
const Home: React.FC = () => {
  return (
    <div>
      <Navbar />
      <main className={stylex.props(styles.s65fb2a7).className || ''}>
        <Hero />
        <Publishing />
        <Identity />
        <Collaboration />
        <Community />
        <Linking />
        <Protocol />
        <GetStarted />
        <Footer />
      </main>
    </div>
  )
}
export default Home
