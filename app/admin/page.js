import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cardData } from "@/util"
import styles from "./page.module.css"
import Link from "next/link"

function AdminPanel() {
    // function handleNavigation(operation){
    //     <Link href={`/admin/${operation}`}/>
    // }
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Panel</h1>
      </header>
      <div className={styles.grid}>
        {cardData.map((item, index) => (
          <Card key={index} className={styles.card}>
            <CardHeader className={styles.cardHeader}>
              <div className="flex flex-col items-center" >
                {item.icon}
                <h2 className="text-xl font-semibold mt-4 text-[#800020]">{item.heading}</h2>
              </div>
            </CardHeader>
            <CardContent className={styles.cardContent}>
              <p >{item.buttonText}</p>
            </CardContent>
            <CardFooter className={styles.cardFooter}>
              <Button variant="outline" className={styles.button} >
                <Link href={`/admin/${item.operation}`}>{item.buttonText}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AdminPanel

// className="flex flex-col items-center"
// className="text-xl font-semibold mt-4 text-[#800020]"
// variant="outline" className="w-full hover:bg-[#800020] hover:text-white transition-colors"


// className={styles.icon}