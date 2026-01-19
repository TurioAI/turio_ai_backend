import { Module } from '@nestjs/common'
import * as admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { resolve } from 'path'

@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        if (admin.apps.length === 0) {
          const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
          if (!path) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is not set')
          }

          const fullPath = resolve(process.cwd(), path)
          const serviceAccount = JSON.parse(
            readFileSync(fullPath, 'utf8'),
          )

          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          })
        }

        return admin
      },
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}

